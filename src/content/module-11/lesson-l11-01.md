在前面的模块中，你用过均线金叉、布林带下轨、MACD 柱这些传统信号——本质上都是「用一个或两个变量判断方向」。现在我们把思路扩展一下：**能不能同时用好几个变量来预测未来的涨跌？**

这就是统计学习的核心思想：让数据说话，而不是你自己硬写 if/else 规则。

## 最简单的 ML：线性回归

用 $Y$ 表示你预测的目标（如 t+1 天的收益率），用 $X_1, X_2, ..., X_p$ 表示你的特征（如 t 天的均线差、RSI 值、过去 5 天涨跌幅……）。

线性回归假设：$Y$ 可以用这些特征的加权和来预测：

$$Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \cdots + \beta_p X_p + \epsilon$$

- $\beta_1$ 告诉你：「在其他条件相同之下，$X_1$ 每增加 1，$Y$ 变化 $\beta_1$」
- 如果 $\beta_1$ 的 t-stat 显著（> 2），说明 $X_1$ 确实有预测力
- $\beta_1$ 的正负号告诉你 $X_1$ 和未来收益是正相关还是负相关

:::highlight blue
线性回归在量化中有一个杀手级优势：**可解释性**。你可以清楚地说出「均线差每增加 1 个标准差，明天的收益预期增加 0.05%」。而一个深度神经网络告诉你「买」，你完全不知道为什么——这在量化中是致命的，因为你会不知道什么时候该停止信任这个模型。
:::

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.model_selection import TimeSeriesSplit

def build_features_from_ohlcv(df):
    """从OHLCV构建特征"""
    close = df['close']
    features = pd.DataFrame(index=df.index)
    # 多时间尺度的收益特征
    for window in [1, 5, 10, 20]:
        features[f'ret_{window}d'] = close.pct_change(window)
    # 波动率特征
    features['vol_5d'] = close.pct_change().rolling(5).std()
    features['vol_20d'] = close.pct_change().rolling(20).std()
    # 均线偏离
    for window in [5, 10, 20]:
        ma = close.rolling(window).mean()
        features[f'ma_{window}d_dev'] = (close - ma) / ma
    # 成交量特征
    features['vol_ratio'] = df['volume'] / df['volume'].rolling(20).mean()
    # 目标变量: 未来1天的收益率
    features['target'] = close.pct_change().shift(-1)
    return features.dropna()

def linear_alpha_model(features_df):
    """训练线性Alpha模型"""
    feature_cols = [c for c in features_df.columns if c != 'target']
    X = features_df[feature_cols]
    y = features_df['target']
    # 时序交叉验证
    tscv = TimeSeriesSplit(n_splits=5)
    scores = []
    for train_idx, val_idx in tscv.split(X):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
        model = Ridge(alpha=1.0)  # L2 正则化
        model.fit(X_train, y_train)
        score = model.score(X_val, y_val)
        scores.append(score)
    print(f"R² scores across folds: {[round(s, 4) for s in scores]}")
    print(f"Mean R²: {np.mean(scores):.4f}")
    print("Note: 金融数据中 R² 0.01-0.05 已经不错，0.05+ 很好")
    # 查看特征重要性（系数）
    model.fit(X, y)
    importance = pd.Series(model.coef_, index=feature_cols).sort_values(key=abs)
    print(f"\nTop features by absolute coefficient:\n{importance.tail(5)}")
    return model
```

## 从预测到持仓

预测出 $Y$（下一期收益率）之后，怎么转换为交易？

**信号强度映射**：

$$\text{position} = \text{clip}(\hat{Y} \times k, -1, 1)$$

- $\hat{Y}$：模型预测的收益率
- $k$：放大系数（如 $k=20$ 意味着预测+5% → 满仓做多）
- clip(-1, 1)：限仓，最多满仓做多或做空

**也可以结合截面**：不预测绝对收益，只预测**相对排名**——在所有品种中排前 20% 的做多，后 20% 的做空。

## 正则化：防止过拟合的保险丝

**Ridge（L2 正则）**：$\min \sum (y - \hat{y})^2 + \alpha \sum \beta_j^2$
- 压缩大系数，但不归零——保留所有特征，但限制它们的贡献

**Lasso（L1 正则）**：$\min \sum (y - \hat{y})^2 + \alpha \sum |\beta_j|$
- 倾向于把无关特征的系数直接压缩到零——自动做特征选择

> 对量化策略来说，Ridge 更实用——你通常不确定哪个特征重要，不如让所有特征都有发言权，但限制极端值。

:::highlight green
线性模型是量化交易里最低门槛的 ML 工具——它不能给你 100% 的准确率，但当你用 100 个特征的 XGBoost 拿到 80% 的回测准确率时，你 100% 在过拟合。在金融数据上，简单的模型 + 严格的时序交叉验证 远胜于 复杂的模型 + 错误的验证方式。
:::

::quiz{id="q_m11a"}
