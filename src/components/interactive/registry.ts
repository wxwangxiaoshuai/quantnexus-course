import type { ComponentType } from "react";
import { LeverageCalculator } from "../../pages/learn/components/interactive/LeverageCalculator";
import { OrderBookSimulator } from "../../pages/learn/components/interactive/OrderBookSimulator";
import { TickToKBar } from "../../pages/learn/components/interactive/TickToKBar";
import { IndicatorLab } from "../../pages/learn/components/interactive/IndicatorLab";
import { StrategySandbox } from "../../pages/learn/components/interactive/StrategySandbox";
import { BacktestMetrics } from "../../pages/learn/components/interactive/BacktestMetrics";
import { OverfittingDemo } from "../../pages/learn/components/interactive/OverfittingDemo";
import { RuinSimulator } from "../../pages/learn/components/interactive/RuinSimulator";
import { RegimeComparator } from "../../pages/learn/components/interactive/RegimeComparator";
import { CodeChallenge } from "../../pages/learn/components/interactive/CodeChallenge";
import { LookAheadBiasChallenge } from "../../pages/learn/components/interactive/LookAheadBiasChallenge";

export const INTERACTIVE_COMPONENTS: Record<string, ComponentType> = {
  leverage: LeverageCalculator,
  orderbook: OrderBookSimulator,
  tickToKBar: TickToKBar,
  indicatorLab: IndicatorLab,
  strategySandbox: StrategySandbox,
  backtestMetrics: BacktestMetrics,
  overfitting: OverfittingDemo,
  ruin: RuinSimulator,
  regime: RegimeComparator,
  codeChallenge: CodeChallenge,
  lookAhead: LookAheadBiasChallenge,
};
