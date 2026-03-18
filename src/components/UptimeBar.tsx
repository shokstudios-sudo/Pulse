interface UptimeBarProps {
  history: Array<'up' | 'down' | 'slow'>;
}

const dayColors = {
  up: "bg-status-up/80",
  down: "bg-status-down",
  slow: "bg-status-slow",
};

const UptimeBar = ({ history }: UptimeBarProps) => {
  return (
    <div className="flex items-center gap-[2px]">
      {history.map((day, i) => (
        <div
          key={i}
          className={`w-[3px] h-3 rounded-[1px] ${dayColors[day]} transition-opacity hover:opacity-70`}
          title={`Day ${i + 1}: ${day}`}
        />
      ))}
    </div>
  );
};

export default UptimeBar;
