import Plot from "react-plotly.js"
import { useEffect, useState } from "react"

import { Paper, Skeleton, Stack } from "@mantine/core"

import type { GetStatsResponse, Stats } from "../shared/types.ts"

const PlotOne = ({ stats }: { stats?: Stats }) => {
  if (!stats) {
    return <Skeleton h={68}></Skeleton>
  }
  // https://github.com/plotly/react-plotly.js/blob/master/README.md#api-reference
  return (
    <Plot
      data={[
        { type: "bar", x: [1], y: [stats.raidCount] },
      ]}
      layout={{
        // paper_bgcolor: "#0000",
        // plot_bgcolor: "#0000",
        template: "plotly_dark",
      }}
      config={{ displayModeBar: false, responsive: true }}
      // style={ {position: 'relative', display: 'inline-block'} }
    />
  )
}

const PlotTwo = ({ stats }: { stats?: Stats }) => {
  if (!stats) {
    return <Skeleton h={200}></Skeleton>
  }
  return <p>asd!!!!!!!!!!1!</p>
}

export const StatsDashboard = () => {
  const [stats, setStats] = useState<Stats>()

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j: GetStatsResponse) => {
        setStats(j)
      })
  }, [])

  return (
    <Stack>
      <PlotOne stats={stats}></PlotOne>
      <PlotTwo stats={stats}></PlotTwo>
    </Stack>
  )
}
