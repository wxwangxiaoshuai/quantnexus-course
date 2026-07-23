上一节学会了用线性模型做预测。但你给模型喂什么数据——这比你用什么模型更重要。**特征工程是把原始 OHLCV 转换成有信息量的信号的过程**。

## 从 OHLCV 到有效特征

| 特征类别 | 示例 | 含义 |
|----------|------|------|
| **收益特征** | ret_1d, ret_5d, ret_20d | 不同时间尺度的涨跌 |
| **波动率特征** | rolling_std_5d, ATR_14d, (high-low)/close | 波动率和日内振幅 |
| **成交量特征** | vol_ratio_20d, OBV_change, turnover | 量能变化 |
| **价格形态** | close_ma_deviation, dist_from_20d_high, RSI | 价格在形态中的位置 |
| **截面特征** | sector_rank, zscore_vs_peers | 相对其他品种的强弱 |

**特征工程的核心原则**：
1. **可解释优先**：如果你不能解释一个特征为什么应该有效，模型也不应该信任它
2. **时序纯净**：t 时刻的特征只能用 ≤ t 时刻的信息，不能使用 t+1 的数据
3. **少即是多**：20 个好特征 > 200 个噪声特征

## 维数灾难（Curse of Dimensionality）

你加入的特征越多，样本空间越大——但历史数据是有限的。一个经验法则：

$$\text{样本量} > \text{特征数} \times 10$$

如果你有 252 天的日线数据，最多只能可靠地使用 25 个特征进行线性回归。如果你有 100 个特征、252 个样本——你的模型毫无统计效力。

```python
import numpy as np
import pandas as pd

def construct_features_ohlcv(df):
    """从OHLCV系统性构建特征矩阵"""
    close, high, low, volume = df['close'], df['high'], df['low'], df['volume']
    features = pd.DataFrame(index=df.index)
    
    # 1. 收益类（多时间尺度）
    for w in [1, 3, 5, 10, 20]:
        features[f'ret_{w}d'] = close.pct_change(w)
    
    # 2. 波动率类
    features['vol_5d'] = close.pct_change().rolling(5).std()
    features['vol_20d'] = close.pct_change().rolling(20).std()
    features['atr_14d'] = (high - low).rolling(14).mean()
    features['hl_range_5d'] = (high.rolling(5).max() - low.rolling(5).min()) / close
    
    # 3. 成交量类
    features['vol_ratio_20d'] = volume / volume.rolling(20).mean()
    features['vol_trend_5d'] = volume.rolling(5).mean() / volume.rolling(20).mean()
    
    # 4. 价格形态
    for w in [5, 10, 20, 60]:
        ma = close.rolling(w).mean()
        features[f'ma_dev_{w}d'] = (close - ma) / close
        features[f'high_dist_{w}d'] = close / high.rolling(w).max() - 1
    
    # 5. 动量/反转
    features['rsi_14'] = compute_rsi(close, 14)  # 需要实现
    features['target'] = close.pct_change().shift(-1)
    return features.dropna()

def compute_rsi(close, period=14):
    """计算RSI。注意：此处用 SMA 近似（rolling.mean），与标准 Wilder RSI 数值略有偏差；实盘请用 TA-Lib 的 Wilder 平滑版本。"""
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(period).mean()
    avg_loss = loss.rolling(period).mean()
    # 除零保护：avg_loss=0（连续全涨）时 RSI=100
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(100)  # avg_loss=0 处填 100
```

## 时序交叉验证——不能用普通 K-Fold！

机器学习的标准做法是随机打乱数据后 K-Fold 交叉验证。这在金融时间序列上是**致命的错误**——因为今天的收益率和昨天的收益率是相关的，随机打乱会导致「用未来的信息验证过去的预测」。

**正确的做法：时序交叉验证**

```
Fold 1: [train: Jan-Mar] → [test: Apr]
Fold 2: [train: Jan-Apr] → [test: May]
Fold 3: [train: Jan-May] → [test: Jun]
Fold 4: [train: Jan-Jun] → [test: Jul]
```

每次验证只用「未来」的数据，训练只用「过去」的数据——时间箭头不可逆。

## 防止过拟合的三道防线

**第一道：正则化**（Ridge/Lasso）——从模型层面约束复杂度
**第二道：时序交叉验证**——从验证方法层面确保时间纯净
**第三道：样本外锁定**——从流程层面防止数据窥探

> 职业量化研究的标准：样本内回测不如实盘是意料之中，样本外回测不如实盘是可以接受，样本外回测远超实盘是危险信号——说明你的验证方法有漏洞。

:::highlight orange
量化 ML 的黄金法则：模型越复杂，验证方法也必须越严谨。一个简单线性模型 + 正确的时间序列交叉验证 远胜于 一个复杂神经网络 + 随机打乱的训练数据。在金融中，简单不是缺陷——简单是你在面对未知未来时唯一的保护。
:::

::quiz{id="q_m11b"}
