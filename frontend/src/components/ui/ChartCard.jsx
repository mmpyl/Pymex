import Card from './Card';

const ChartCard = ({ title, children, action = null }) => (
  <Card title={title} action={action}>
    <div className="h-[280px]">{children}</div>
  </Card>
);

export default ChartCard;
