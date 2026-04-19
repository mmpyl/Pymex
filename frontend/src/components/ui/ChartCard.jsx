import Card from './Card';

const ChartCard = ({ title, children, action = null }) => (
  <Card title={title} action={action}>
    <div style={{ height: 280 }}>{children}</div>
  </Card>
);

export default ChartCard;
