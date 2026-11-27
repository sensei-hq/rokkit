## BarChart {#bar}

```svelte
<script>
  import { BarChart } from '@rokkit/chart'
  const data = [
    { quarter: 'Q1', revenue: 120 },
    { quarter: 'Q2', revenue: 180 },
    { quarter: 'Q3', revenue: 160 },
    { quarter: 'Q4', revenue: 210 }
  ]
</script>

<BarChart {data} x="quarter" y="revenue" />
```

## LineChart {#line}

```svelte
<LineChart {data} x="month" y="revenue" color="product" legend />
```

## AreaChart {#area}

```svelte
<AreaChart {data} x="month" y="revenue" fill="product" stack legend />
```

## PieChart {#pie}

```svelte
<PieChart {data} y="share" fill="segment" innerRadius={60} legend />
```

## ScatterPlot {#scatter}

```svelte
<ScatterPlot {data} x="displ" y="hwy" color="class" legend />
```

## BubbleChart {#bubble}

```svelte
<BubbleChart {data} x="cty" y="hwy" size="displ" color="class" legend />
```

## BoxPlot {#box}

```svelte
<BoxPlot {data} x="class" y="hwy" fill="drv" legend />
```

## ViolinPlot {#violin}

```svelte
<ViolinPlot {data} x="class" y="hwy" fill="drv" legend />
```

## Main sequence (Martin) {#main-sequence}

```svelte
<script>
  import { PlotChart, Plot } from '@rokkit/chart'
  // one row per component: instability I = Ce/(Ca+Ce), abstractness A
  let { components } = $props()
  const pain = [[0, 0], [0.5, 0], [0, 0.5]]
  const useless = [[1, 1], [0.5, 1], [1, 0.5]]
</script>

<PlotChart data={components} xDomain={[0, 1]} yDomain={[0, 1]} legend tooltip>
  <Plot.Region name="pain" points={pain} label="Zone of pain" />
  <Plot.Region name="uselessness" points={useless} label="Zone of uselessness" />
  <Plot.Hull x="instability" y="abstractness" color="package" />
  <Plot.Rule slope={-1} intercept={1} label="main sequence" />
  <Plot.Point x="instability" y="abstractness" color="package" size="loc" />
</PlotChart>
```

## Hotspots — an open-ended Region {#hotspots}

```svelte
<PlotChart data={modules} tooltip>
  <!-- null runs to the edge: "p95 and beyond" -->
  <Plot.Region x={[p95.complexity, null]} y={[p95.churn, null]} label="Hotspots" />
  <Plot.Contour x="complexity" y="churn" bandwidth={24} />
  <Plot.Point x="complexity" y="churn" color="package" size="loc" />
</PlotChart>
```

## Sparkline {#sparkline}

```svelte
<Sparkline data={[12, -8, 23, -17, 34, 56, -9, 41]} type="bar" baseline={0} highlight={['min', 'max', 'last']} trend="linear" width={140} height={36} />
```
