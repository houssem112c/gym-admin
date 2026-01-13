interface MuscleBodyDiagramProps {
  selectedMuscle: string;
  highlightColor?: string;
}

export default function MuscleBodyDiagram({ selectedMuscle, highlightColor = '#FF4081' }: MuscleBodyDiagramProps) {
  const isHighlighted = (muscle: string) => {
    // Check for exact match or fullbody
    if (selectedMuscle === muscle || selectedMuscle === 'fullbody') return true;
    
    // Legacy support - old muscle names highlight all related subdivisions
    const muscleGroups: { [key: string]: string[] } = {
      'chest': ['upper-chest', 'lower-chest'],
      'back': ['upper-back', 'mid-back', 'lower-back'],
      'shoulders': ['front-delts', 'side-delts', 'rear-delts'],
      'abs': ['upper-abs', 'lower-abs', 'obliques']
    };
    
    if (muscleGroups[selectedMuscle]?.includes(muscle)) return true;
    
    return false;
  };

  const getMuscleColor = (muscle: string) => {
    return isHighlighted(muscle) ? highlightColor : '#1a1a1a';
  };

  const getMuscleOpacity = (muscle: string) => {
    return isHighlighted(muscle) ? '1' : '0.25';
  };
  
  const getSkinTone = () => '#2d2d2d';
  const getJointColor = () => '#252525';

  return (
    <div className="flex gap-10 justify-center items-start flex-wrap">
      {/* Front View */}
      <div className="flex flex-col items-center">
        <h4 className="text-sm font-bold text-gray-300 mb-3 tracking-wide">FRONT VIEW</h4>
        <svg
          width="180"
          height="350"
          viewBox="0 0 180 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-2xl"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(60,60,60,0.3), transparent)' }}
        >
          {/* Defs for gradients and filters */}
          <defs>
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#1a1a1a', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#2d2d2d', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#1a1a1a', stopOpacity: 1 }} />
            </linearGradient>
            
            <radialGradient id="muscleGradient">
              <stop offset="30%" style={{ stopColor: 'rgba(255,255,255,0.15)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.3)', stopOpacity: 1 }} />
            </radialGradient>
            
            <filter id="innerShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="1" dy="1" result="offsetblur"/>
              <feFlood floodColor="#000000" floodOpacity="0.4"/>
              <feComposite in2="offsetblur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Head with more realistic shape */}
          <ellipse cx="90" cy="28" rx="20" ry="24" fill="url(#skinGradient)" stroke="#444" strokeWidth="2" />
          <ellipse cx="90" cy="28" rx="20" ry="24" fill="url(#muscleGradient)" opacity="0.3" />
          
          {/* Facial features for depth */}
          <ellipse cx="84" cy="26" rx="2" ry="3" fill="#0a0a0a" opacity="0.6" />
          <ellipse cx="96" cy="26" rx="2" ry="3" fill="#0a0a0a" opacity="0.6" />
          
          {/* Neck with depth */}
          <path 
            d="M 82 50 L 78 62 L 102 62 L 98 50 Z" 
            fill="url(#skinGradient)" 
            stroke="#444" 
            strokeWidth="1.5"
          />
          <line x1="90" y1="50" x2="90" y2="62" stroke="#222" strokeWidth="1" opacity="0.4" />
          
          {/* Front Deltoids (Front Shoulders) - 3 heads visible */}
          <path
            d="M 48 68 Q 52 62, 58 64 Q 62 66, 62 72 Q 60 78, 54 78 Q 48 76, 48 68 Z"
            fill={getMuscleColor('front-delts')}
            opacity={getMuscleOpacity('front-delts')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <path
            d="M 132 68 Q 128 62, 122 64 Q 118 66, 118 72 Q 120 78, 126 78 Q 132 76, 132 68 Z"
            fill={getMuscleColor('front-delts')}
            opacity={getMuscleOpacity('front-delts')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          
          {/* Side Deltoids - rounded cap */}
          <ellipse
            cx="42" cy="75" rx="11" ry="14"
            fill={getMuscleColor('side-delts')}
            opacity={getMuscleOpacity('side-delts')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          <ellipse
            cx="138" cy="75" rx="11" ry="14"
            fill={getMuscleColor('side-delts')}
            opacity={getMuscleOpacity('side-delts')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          
          {/* Upper Chest - Pectoralis Major (Clavicular Head) */}
          <path
            d="M 63 68 Q 68 74, 76 76 Q 82 78, 90 78 Q 90 72, 90 68 Q 82 64, 74 64 Q 68 64, 63 68 Z"
            fill={getMuscleColor('upper-chest')}
            opacity={getMuscleOpacity('upper-chest')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <path
            d="M 117 68 Q 112 74, 104 76 Q 98 78, 90 78 Q 90 72, 90 68 Q 98 64, 106 64 Q 112 64, 117 68 Z"
            fill={getMuscleColor('upper-chest')}
            opacity={getMuscleOpacity('upper-chest')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          
          {/* Lower Chest - Pectoralis Major (Sternal Head) */}
          <path
            d="M 76 76 Q 72 84, 72 92 Q 74 98, 82 100 Q 88 100, 90 98 Q 90 88, 90 78 Q 84 76, 76 76 Z"
            fill={getMuscleColor('lower-chest')}
            opacity={getMuscleOpacity('lower-chest')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <path
            d="M 104 76 Q 108 84, 108 92 Q 106 98, 98 100 Q 92 100, 90 98 Q 90 88, 90 78 Q 96 76, 104 76 Z"
            fill={getMuscleColor('lower-chest')}
            opacity={getMuscleOpacity('lower-chest')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          
          {/* Chest Separation (Sternum) with depth */}
          <line x1="90" y1="64" x2="90" y2="104" stroke="#1a1a1a" strokeWidth="2" opacity="0.6" />
          <line x1="90" y1="64" x2="90" y2="104" stroke="#444" strokeWidth="0.8" opacity="0.4" />
          
          {/* Biceps - Biceps Brachii with peak */}
          <ellipse
            cx="44" cy="95" rx="13" ry="22"
            fill={getMuscleColor('biceps')}
            opacity={getMuscleOpacity('biceps')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <ellipse
            cx="136" cy="95" rx="13" ry="22"
            fill={getMuscleColor('biceps')}
            opacity={getMuscleOpacity('biceps')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          {/* Biceps peak definition */}
          <ellipse cx="44" cy="92" rx="8" ry="10" fill="#000" opacity="0.15" />
          <ellipse cx="136" cy="92" rx="8" ry="10" fill="#000" opacity="0.15" />
          
          {/* Upper Abs - Rectus Abdominis (more realistic shape) */}
          <g className="transition-all duration-300">
            {/* Top row of abs with slight curve */}
            <path
              d="M 76 108 Q 76 104, 79 104 Q 82 104, 82 108 Q 82 113, 79 115 Q 76 115, 76 110 Z"
              fill={getMuscleColor('upper-abs')}
              opacity={getMuscleOpacity('upper-abs')}
              stroke="#444" strokeWidth="1"
              filter="url(#innerShadow)"
            />
            <path
              d="M 98 108 Q 98 104, 101 104 Q 104 104, 104 108 Q 104 113, 101 115 Q 98 115, 98 110 Z"
              fill={getMuscleColor('upper-abs')}
              opacity={getMuscleOpacity('upper-abs')}
              stroke="#444" strokeWidth="1"
              filter="url(#innerShadow)"
            />
            {/* Second row */}
            <path
              d="M 76 120 Q 76 116, 79 116 Q 82 116, 82 120 Q 82 126, 79 128 Q 76 128, 76 123 Z"
              fill={getMuscleColor('upper-abs')}
              opacity={getMuscleOpacity('upper-abs')}
              stroke="#444" strokeWidth="1"
              filter="url(#innerShadow)"
            />
            <path
              d="M 98 120 Q 98 116, 101 116 Q 104 116, 104 120 Q 104 126, 101 128 Q 98 128, 98 123 Z"
              fill={getMuscleColor('upper-abs')}
              opacity={getMuscleOpacity('upper-abs')}
              stroke="#444" strokeWidth="1"
              filter="url(#innerShadow)"
            />
          </g>
          
          {/* Lower Abs - Bottom two packs */}
          <g className="transition-all duration-300">
            <path
              d="M 76 133 Q 76 129, 79 129 Q 82 129, 82 133 Q 82 139, 79 142 Q 76 142, 76 137 Z"
              fill={getMuscleColor('lower-abs')}
              opacity={getMuscleOpacity('lower-abs')}
              stroke="#444" strokeWidth="1"
              filter="url(#innerShadow)"
            />
            <path
              d="M 98 133 Q 98 129, 101 129 Q 104 129, 104 133 Q 104 139, 101 142 Q 98 142, 98 137 Z"
              fill={getMuscleColor('lower-abs')}
              opacity={getMuscleOpacity('lower-abs')}
              stroke="#444" strokeWidth="1"
              filter="url(#innerShadow)"
            />
          </g>
          
          {/* Linea Alba (centerline) */}
          <line x1="90" y1="104" x2="90" y2="146" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.6" />
          
          {/* Forearms - Tapered realistic shape */}
          <path
            d="M 42 118 L 38 156 Q 36 162, 42 164 Q 48 162, 48 156 L 46 118 Z"
            fill={getMuscleColor('forearms')}
            opacity={getMuscleOpacity('forearms')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <path
            d="M 138 118 L 142 156 Q 144 162, 138 164 Q 132 162, 132 156 L 134 118 Z"
            fill={getMuscleColor('forearms')}
            opacity={getMuscleOpacity('forearms')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          {/* Forearm muscle definition */}
          <line x1="45" y1="120" x2="42" y2="158" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          <line x1="135" y1="120" x2="138" y2="158" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          
          {/* Obliques - External obliques with fiber lines */}
          <path
            d="M 68 112 L 62 148 Q 60 154, 66 156 L 72 152 L 74 112 Z"
            fill={getMuscleColor('obliques')}
            opacity={getMuscleOpacity('obliques')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <path
            d="M 112 112 L 118 148 Q 120 154, 114 156 L 108 152 L 106 112 Z"
            fill={getMuscleColor('obliques')}
            opacity={getMuscleOpacity('obliques')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          {/* Oblique fiber lines */}
          <line x1="70" y1="120" x2="64" y2="144" stroke="#222" strokeWidth="0.5" opacity="0.3" />
          <line x1="110" y1="120" x2="116" y2="144" stroke="#222" strokeWidth="0.5" opacity="0.3" />
          
          {/* Quadriceps - 4 muscle heads visible */}
          {/* Vastus Lateralis (outer) */}
          <ellipse
            cx="78" cy="215" rx="16" ry="48"
            fill={getMuscleColor('quads')}
            opacity={getMuscleOpacity('quads')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <ellipse
            cx="102" cy="215" rx="16" ry="48"
            fill={getMuscleColor('quads')}
            opacity={getMuscleOpacity('quads')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          
          {/* Quad muscle separation (4 heads: VL, RF, VM, VI) */}
          <line x1="78" y1="180" x2="78" y2="245" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.5" />
          <line x1="102" y1="180" x2="102" y2="245" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.5" />
          <line x1="72" y1="190" x2="72" y2="240" stroke="#222" strokeWidth="0.8" opacity="0.4" />
          <line x1="84" y1="185" x2="84" y2="245" stroke="#222" strokeWidth="0.8" opacity="0.4" />
          <line x1="96" y1="185" x2="96" y2="245" stroke="#222" strokeWidth="0.8" opacity="0.4" />
          <line x1="108" y1="190" x2="108" y2="240" stroke="#222" strokeWidth="0.8" opacity="0.4" />
          
          {/* Calves - Gastrocnemius with realistic bulge */}
          <ellipse
            cx="78" cy="285" rx="11" ry="28"
            fill={getMuscleColor('calves')}
            opacity={getMuscleOpacity('calves')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <ellipse
            cx="102" cy="285" rx="11" ry="28"
            fill={getMuscleColor('calves')}
            opacity={getMuscleOpacity('calves')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          {/* Calf definition (medial/lateral heads) */}
          <ellipse cx="78" cy="280" rx="7" ry="15" fill="#000" opacity="0.15" />
          <ellipse cx="102" cy="280" rx="7" ry="15" fill="#000" opacity="0.15" />
          {/* Achilles tendon */}
          <path d="M 78 310 L 78 318" stroke="#2a2a2a" strokeWidth="4" opacity="0.6" />
          <path d="M 102 310 L 102 318" stroke="#2a2a2a" strokeWidth="4" opacity="0.6" />
          
          {/* Hands - more realistic */}
          <ellipse cx="40" cy="170" rx="7" ry="10" fill="url(#skinGradient)" stroke="#444" strokeWidth="1.5" />
          <ellipse cx="140" cy="170" rx="7" ry="10" fill="url(#skinGradient)" stroke="#444" strokeWidth="1.5" />
          
          {/* Feet - more detailed */}
          <ellipse cx="78" cy="330" rx="9" ry="12" fill="url(#skinGradient)" stroke="#444" strokeWidth="1.5" />
          <ellipse cx="102" cy="330" rx="9" ry="12" fill="url(#skinGradient)" stroke="#444" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Back View */}
      <div className="flex flex-col items-center">
        <h4 className="text-sm font-bold text-gray-300 mb-3 tracking-wide">BACK VIEW</h4>
        <svg
          width="180"
          height="350"
          viewBox="0 0 180 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-2xl"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(60,60,60,0.3), transparent)' }}
        >
          {/* Head - back view */}
          <ellipse cx="90" cy="28" rx="20" ry="24" fill="url(#skinGradient)" stroke="#444" strokeWidth="2" />
          
          {/* Neck with trapezius taper */}
          <path 
            d="M 82 50 L 74 62 L 106 62 L 98 50 Z" 
            fill="url(#skinGradient)" 
            stroke="#444" 
            strokeWidth="1.5"
          />
          <line x1="90" y1="50" x2="90" y2="62" stroke="#222" strokeWidth="1" opacity="0.4" />
          
          {/* Rear Deltoids (Back Shoulders) - 3 heads */}
          <path
            d="M 48 68 Q 52 62, 58 64 Q 62 66, 62 72 Q 60 78, 54 78 Q 48 76, 48 68 Z"
            fill={getMuscleColor('rear-delts')}
            opacity={getMuscleOpacity('rear-delts')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <path
            d="M 132 68 Q 128 62, 122 64 Q 118 66, 118 72 Q 120 78, 126 78 Q 132 76, 132 68 Z"
            fill={getMuscleColor('rear-delts')}
            opacity={getMuscleOpacity('rear-delts')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          
          {/* Side Deltoids - rounded cap */}
          <ellipse
            cx="42" cy="75" rx="11" ry="14"
            fill={getMuscleColor('side-delts')}
            opacity={getMuscleOpacity('side-delts')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          <ellipse
            cx="138" cy="75" rx="11" ry="14"
            fill={getMuscleColor('side-delts')}
            opacity={getMuscleOpacity('side-delts')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          
          {/* Upper Back (Trapezius) - Diamond shape */}
          <path
            d="M 70 64 L 90 62 L 110 64 L 108 88 L 90 92 L 72 88 Z"
            fill={getMuscleColor('upper-back')}
            opacity={getMuscleOpacity('upper-back')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          
          {/* Trap Definition Lines (muscle fibers) */}
          <line x1="90" y1="62" x2="90" y2="90" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.6" />
          <line x1="82" y1="70" x2="90" y2="85" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          <line x1="98" y1="70" x2="90" y2="85" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          
          {/* Mid Back (Latissimus Dorsi) - Wing-like sweep */}
          <path
            d="M 72 88 L 64 138 Q 60 148, 68 154 L 76 150 L 76 88 Z"
            fill={getMuscleColor('mid-back')}
            opacity={getMuscleOpacity('mid-back')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <path
            d="M 108 88 L 116 138 Q 120 148, 112 154 L 104 150 L 104 88 Z"
            fill={getMuscleColor('mid-back')}
            opacity={getMuscleOpacity('mid-back')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          
          {/* Lat Definition Lines (muscle fibers sweeping outward) */}
          <line x1="70" y1="100" x2="64" y2="130" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          <line x1="72" y1="110" x2="66" y2="138" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          <line x1="110" y1="100" x2="116" y2="130" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          <line x1="108" y1="110" x2="114" y2="138" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          
          {/* Triceps - 3 heads visible (long, lateral, medial) */}
          <ellipse
            cx="44" cy="95" rx="13" ry="22"
            fill={getMuscleColor('triceps')}
            opacity={getMuscleOpacity('triceps')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <ellipse
            cx="136" cy="95" rx="13" ry="22"
            fill={getMuscleColor('triceps')}
            opacity={getMuscleOpacity('triceps')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          {/* Triceps horseshoe definition */}
          <path d="M 40 88 Q 44 92, 48 88" stroke="#222" strokeWidth="0.8" fill="none" opacity="0.4" />
          <path d="M 132 88 Q 136 92, 140 88" stroke="#222" strokeWidth="0.8" fill="none" opacity="0.4" />
          
          {/* Forearms - Tapered with muscle definition */}
          <path
            d="M 42 118 L 38 156 Q 36 162, 42 164 Q 48 162, 48 156 L 46 118 Z"
            fill={getMuscleColor('forearms')}
            opacity={getMuscleOpacity('forearms')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <path
            d="M 138 118 L 142 156 Q 144 162, 138 164 Q 132 162, 132 156 L 134 118 Z"
            fill={getMuscleColor('forearms')}
            opacity={getMuscleOpacity('forearms')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          {/* Forearm extensors definition */}
          <line x1="45" y1="120" x2="42" y2="158" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          <line x1="135" y1="120" x2="138" y2="158" stroke="#222" strokeWidth="0.5" opacity="0.4" />
          
          {/* Lower Back (Erector Spinae) - Christmas tree shape */}
          <path
            d="M 76 150 L 72 172 Q 70 178, 76 180 L 82 176 L 82 150 Z"
            fill={getMuscleColor('lower-back')}
            opacity={getMuscleOpacity('lower-back')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <path
            d="M 104 150 L 108 172 Q 110 178, 104 180 L 98 176 L 98 150 Z"
            fill={getMuscleColor('lower-back')}
            opacity={getMuscleOpacity('lower-back')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          
          {/* Spinal erector columns */}
          <line x1="82" y1="150" x2="78" y2="176" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.6" />
          <line x1="98" y1="150" x2="102" y2="176" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.6" />
          <line x1="90" y1="150" x2="90" y2="178" stroke="#222" strokeWidth="0.8" opacity="0.5" />
          
          {/* Glutes (Gluteus Maximus) - rounded realistic shape */}
          <ellipse
            cx="80" cy="195" rx="16" ry="20"
            fill={getMuscleColor('glutes')}
            opacity={getMuscleOpacity('glutes')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <ellipse
            cx="100" cy="195" rx="16" ry="20"
            fill={getMuscleColor('glutes')}
            opacity={getMuscleOpacity('glutes')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          {/* Glute separation */}
          <line x1="90" y1="178" x2="90" y2="210" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.6" />
          
          {/* Hamstrings - Biceps Femoris, Semitendinosus */}
          <ellipse
            cx="78" cy="225" rx="13" ry="38"
            fill={getMuscleColor('hamstrings')}
            opacity={getMuscleOpacity('hamstrings')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <ellipse
            cx="102" cy="225" rx="13" ry="38"
            fill={getMuscleColor('hamstrings')}
            opacity={getMuscleOpacity('hamstrings')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          
          {/* Hamstring 2-head separation */}
          <line x1="74" y1="200" x2="74" y2="250" stroke="#222" strokeWidth="0.8" opacity="0.4" />
          <line x1="82" y1="200" x2="82" y2="250" stroke="#222" strokeWidth="0.8" opacity="0.4" />
          <line x1="98" y1="200" x2="98" y2="250" stroke="#222" strokeWidth="0.8" opacity="0.4" />
          <line x1="106" y1="200" x2="106" y2="250" stroke="#222" strokeWidth="0.8" opacity="0.4" />
          
          {/* Calves - Gastrocnemius back view with realistic bulge */}
          <ellipse
            cx="78" cy="285" rx="11" ry="28"
            fill={getMuscleColor('calves')}
            opacity={getMuscleOpacity('calves')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          <ellipse
            cx="102" cy="285" rx="11" ry="28"
            fill={getMuscleColor('calves')}
            opacity={getMuscleOpacity('calves')}
            stroke="#444"
            strokeWidth="1.5"
            className="transition-all duration-300"
            filter="url(#innerShadow)"
          />
          {/* Calf 2-head definition */}
          <ellipse cx="78" cy="280" rx="7" ry="15" fill="#000" opacity="0.15" />
          <ellipse cx="102" cy="280" rx="7" ry="15" fill="#000" opacity="0.15" />
          {/* Achilles tendon */}
          <path d="M 78 310 L 78 318" stroke="#2a2a2a" strokeWidth="4" opacity="0.6" />
          <path d="M 102 310 L 102 318" stroke="#2a2a2a" strokeWidth="4" opacity="0.6" />
          
          {/* Hands - more realistic */}
          <ellipse cx="40" cy="170" rx="7" ry="10" fill="url(#skinGradient)" stroke="#444" strokeWidth="1.5" />
          <ellipse cx="140" cy="170" rx="7" ry="10" fill="url(#skinGradient)" stroke="#444" strokeWidth="1.5" />
          
          {/* Feet - more detailed */}
          <ellipse cx="78" cy="330" rx="9" ry="12" fill="url(#skinGradient)" stroke="#444" strokeWidth="1.5" />
          <ellipse cx="102" cy="330" rx="9" ry="12" fill="url(#skinGradient)" stroke="#444" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
