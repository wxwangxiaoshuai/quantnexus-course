## 线性模型不够用的时候——量化交易中的非线性

m11l1 的线性模型假设「特征和收益率之间是线性关系」。但现实中的金融规律往往是非线性的：

- RSI 从 70 涨到 80（超买区）→ 做空信号更强（非线性）
- RSI 从 30 涨到 40（正常区）→ 几乎没有信号
- 均线金叉 + 成交量放大 → 信号强度远大于两者单独相加（交互效应）

线性模型无法捕捉这些非线性关系。**树模型天然适合处理这种情况**——它用 if-else 的逻辑分支来拟合数据，本质上是「自动化的规则发现」。

> 关联课程：m11l1「线性模型」→ m11l2「特征工程」

## 决策树：最简单的树模型

一棵决策树就是一系列 if-else 判断：

```
if RSI(14) < 30:
    if Volume_Ratio > 1.5:
        predict: +0.02（超卖 + 放量 → 反弹）
    else:
        predict: +0.005（超卖但没有放量 → 弱反弹）
else:
    if MA5 > MA20:
        predict: +0.01（趋势向上）
    else:
        predict: -0.005（趋势向下）
```

**树模型的优势**：
- 自动发现特征之间的交互效应（RSI + Volume 的组合效果）
- 天然处理非线性关系（不需要手动构建 RSI² 或交互项）
- 特征重要性——告诉你哪些特征真正在起作用

**树模型的劣势**：
- 单棵决策树极容易过拟合（把训练数据里的每一个噪音点都当成规律）
- 对训练数据的微小变化非常敏感（换一段数据，整棵树的结构可能完全不同）

:::highlight blue
## 集成学习：用「投票」解决过拟合

单棵树容易过拟合，但 **100 棵树一起投票**就不容易过拟合了。这就是集成学习的核心思想。

**随机森林（Random Forest）**：
- 训练 100 棵独立的决策树
- 每棵树用随机抽样的数据子集训练（Bootstrap）
- 每棵树的每次分裂只能看随机抽样的特征子集
- 最终预测 = 100 棵树的预测取平均

**梯度提升树（Gradient Boosting / LightGBM / XGBoost）**：
- 第一棵树正常拟合
- 第二棵树拟合「第一棵树的残差（错误）」
- 第三棵树拟合「前两棵树的残差」
- ...不断迭代，每棵树都在纠正前面所有树的错误
- 最终预测 = 所有树的预测求和

**Boosting vs Bagging**：
| 维度 | 随机森林（Bagging）| 梯度提升（Boosting）|
|------|-------------------|-------------------|
| 训练方式 | 100 棵树独立并行训练 | 串行训练，每棵纠正前一棵 |
| 过拟合风险 | 低（天然抗过拟合）| 较高（需要早停 + 正则化）|
| 预测精度 | 中等 | 高（Kaggle 竞赛首选）|
| 金融适用性 | 较好（稳健）| 谨慎使用（容易过拟合）|

> 在金融数据上，随机森林通常比梯度提升更安全——因为金融数据的信噪比极低，Boosting 很容易把噪音当成信号来「纠正」。
:::

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import TimeSeriesSplit

def tree_alpha_model(features_df, n_estimators=100):
    """
    用随机森林做 Alpha 预测
    注意：必须使用时序交叉验证，不能用普通 K-Fold
    """
    feature_cols = [c for c in features_df.columns if c != 'target']
    X = features_df[feature_cols].values
    y = features_df['target'].values
    
    tscv = TimeSeriesSplit(n_splits=5)
    scores = []
    feature_importances = []
    
    for train_idx, val_idx in tscv.split(X):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]
        
        model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=5,               # 限制深度防止过拟合
            min_samples_leaf=20,        # 叶节点最少样本数
            max_features='sqrt',        # 每次分裂只看 sqrt(n_features) 个特征
            random_state=42,
        )
        model.fit(X_train, y_train)
        score = model.score(X_val, y_val)
        scores.append(score)
        feature_importances.append(model.feature_importances_)
    
    print(f"R² scores across folds: {[round(s, 4) for s in scores]}")
    print(f"Mean R²: {np.mean(scores):.4f}")
    
    # 平均特征重要性
    avg_importance = np.mean(feature_importances, axis=0)
    importance_df = pd.DataFrame({
        'feature': feature_cols,
        'importance': avg_importance
    }).sort_values('importance', ascending=False)
    print(f"\nTop 5 features by importance:\n{importance_df.head(5)}")
    return model, importance_df
```

## 树模型在金融中的三大陷阱

**陷阱 1：时序泄漏比线性模型更隐蔽**

树模型对异常值敏感。如果你在特征工程中不小心用了 `fillna(method='bfill')`（用未来数据回填），线性模型可能只是轻微高估 R²，但树模型会把这个「未来信息」当成一个极其重要的特征，整棵树的结构都会被它主导。

**陷阱 2：特征重要性 ≠ 预测力**

树模型输出的「特征重要性」看起来很有用，但在金融数据中要小心解读：
- 如果两个特征高度相关（如 ret_5d 和 ret_20d），树模型会随机选一个赋予高重要性
- 特征重要性只告诉你「模型用了哪些特征」，不告诉你「这些特征是否真的有预测力」
- 验证方法：删除某个特征后重新训练，如果 R² 没变 → 这个特征不重要

**陷阱 3：树模型天然倾向高方差特征**

树模型的分裂规则倾向于选择「取值多」的特征。如果某个特征有 1000 个不同取值（如价格本身），另一个特征只有 10 个（如 RSI 分位数），树模型会偏好前者——即使前者的预测力更弱。

> 应对：对连续特征做分箱（binning），减少取值数量。

::quiz{id="q_m11c"}
