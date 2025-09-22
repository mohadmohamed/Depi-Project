import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import attemptsFile from '../../data/attempts.json'

export default function AttemptsGraph() {
    const data = attemptsFile.attempts.map((a) => ({
  date: a.date.split("T")[0], 
  score: a.score,
  percentage: ((a.score / a.total) * 100).toFixed(2),
  duration: (a.durationSec / 60).toFixed(2), 
}));

  return (
    <div id="mi-graph" >
      <ResponsiveContainer>
     <LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  
  {/* Y axis for percentage */}
  <YAxis yAxisId="left" domain={[0, 10]} />
  
  {/* Y axis for score */}
  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
  
  <Tooltip />
  <Legend />
  
  {/* percentage line */}
  <Line 
    type="monotone" 
    dataKey="score" 
    stroke="#6660deff" 
    yAxisId="left" 
  />
  
  {/* score line */}
  {/* <Line 
    type="monotone" 
    dataKey="percentage" 
    stroke="#82ca9d" 
    yAxisId="right" 
  /> */}
</LineChart>
      </ResponsiveContainer>
    </div>
  );
}