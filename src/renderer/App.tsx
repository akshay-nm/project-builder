import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Chart, TreeNode } from './Chart';

const rawTree: TreeNode = {
  name: 'T',
  children: [
    {
      name: 'A',
      children: [
        { name: 'A1' },
        { name: 'A2' },
        { name: 'A3' },
        {
          name: 'C',
          children: [
            {
              name: 'C1',
            },
            {
              name: 'D',
              children: [
                {
                  name: 'D1',
                },
                {
                  name: 'D2',
                },
                {
                  name: 'D3',
                },
              ],
            },
          ],
        },
      ],
    },
    { name: 'Z' },
    {
      name: 'B',
      children: [{ name: 'B1' }, { name: 'B2' }, { name: 'B3' }],
    },
  ],
};

function Hello() {
  return (
    <div>
      <div>CPM</div>
      <div>
        <button type="button">Clear</button>
        <button type="button">Save</button>
      </div>
      <Chart
        width={1000}
        height={1000}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        rawTree={rawTree}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
