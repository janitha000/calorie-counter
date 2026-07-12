'use client'

import { useRouter } from 'next/navigation';

export function StatsCharts({ data, range, limits }) {
  const router = useRouter();

  const handleRangeChange = (newRange) => {
    router.replace(`/stats?range=${newRange}`);
  };

  const getColor = (value, limit, isProtein, isFasting) => {
    if (value === 0) return 'bg-gray-200';
    
    if (isFasting) {
      // Fasting logic: >= 16h is green
      return value >= limit ? 'bg-green-400' : 'bg-orange-400';
    }
    
    if (isProtein) {
      // Protein logic: > limit is green, > 80% is orange, < 80% is red
      if (value >= limit) return 'bg-green-400';
      if (value >= limit * 0.8) return 'bg-orange-400';
      return 'bg-red-400';
    }
    
    // Standard logic (Calories, Carbs, Fat, Sugar)
    // <= limit is green, <= 120% is orange, > 120% is red
    if (value <= limit) return 'bg-green-400';
    if (value <= limit * 1.2) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const BarChartSection = ({ title, unit, dataKey, limit, isProtein = false, isFasting = false, maxScaleMultiplier = 1.5 }) => {
    const maxScale = limit * maxScaleMultiplier;
    const targetPercent = (limit / maxScale) * 100;

    return (
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-[16px] text-gray-900">{title}</h2>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">
            {isFasting ? `Target: ${limit}h+` : `Target: ${limit}${unit}`}
          </div>
        </div>

        <div className="relative h-48 w-full pt-4 overflow-x-auto hide-scrollbar">
          <div className={`min-w-full h-full flex items-end justify-between ${range === 'monthly' ? 'w-[800px] gap-2' : 'gap-4'} relative`}>
            {/* Target Line */}
            <div 
              className="absolute w-full border-t-2 border-dashed border-black z-20 flex items-center justify-start pointer-events-none"
              style={{ bottom: `${targetPercent}%` }}
            >
              <span className="text-[9px] text-white font-bold bg-black px-1.5 py-0.5 rounded -mt-3 absolute left-0 z-30">Target</span>
            </div>

            {data.map((day, i) => {
              const val = day[dataKey];
              const heightPercent = Math.min(100, (val / maxScale) * 100);
              const colorClass = getColor(val, limit, isProtein, isFasting);

              return (
                <div key={i} className="flex flex-col items-center gap-2 relative z-10 flex-1 min-w-[20px] group">
                  <div className="text-[8px] font-bold text-gray-500 absolute -top-4 bg-white/90 z-20 px-0.5 rounded">
                    {val > 0 ? (Number.isInteger(val) ? val : val.toFixed(1)) : ''}
                  </div>
                  <div className="w-full bg-gray-50 rounded-t-md relative overflow-hidden" style={{ height: '120px' }}>
                    <div 
                      className={`absolute bottom-0 w-full rounded-t-md transition-all duration-1000 ${colorClass}`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 truncate w-full text-center">{day.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Toggle */}
      <div className="bg-white p-2 rounded-2xl flex gap-1 shadow-sm border border-gray-100">
        <button 
          onClick={() => handleRangeChange('weekly')}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${range === 'weekly' ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-50'}`}
        >
          Weekly
        </button>
        <button 
          onClick={() => handleRangeChange('monthly')}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${range === 'monthly' ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-50'}`}
        >
          Monthly
        </button>
      </div>

      <BarChartSection title="Daily Calories" unit="" dataKey="calories" limit={limits.calories} />
      <BarChartSection title="Daily Protein" unit="g" dataKey="protein" limit={limits.protein} isProtein={true} />
      <BarChartSection title="Daily Carbs" unit="g" dataKey="carbs" limit={limits.carbs} />
      <BarChartSection title="Daily Fat" unit="g" dataKey="fat" limit={limits.fat} />
      <BarChartSection title="Daily Sugar" unit="g" dataKey="sugar" limit={limits.sugar} />
      <BarChartSection title="Fasting Hours" unit="h" dataKey="fasting" limit={limits.fasting} isFasting={true} maxScaleMultiplier={1.5} />
      
    </div>
  );
}
