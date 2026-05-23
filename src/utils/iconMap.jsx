import React from 'react';
import {
  Flame, Zap, Gem, Sprout, GraduationCap, Rocket, FlaskConical, Github,
  Calendar, Trophy, Medal, Star, Target, BookOpen, Dumbbell, ThumbsUp,
} from 'lucide-react';

/**
 * Mapea tanto los strings del catálogo (nuevos) como los emojis legacy
 * para renderizar íconos Lucide en lugar de emojis que causan problemas de encoding.
 */
export const getIconForEmoji = (emoji, size = 24) => {
  switch (emoji) {
    case 'fire':    return <Flame    size={size} className="text-warning-500" />;
    case 'bolt':    return <Zap      size={size} className="text-accent-500" />;
    case 'muscle':  return <Dumbbell size={size} className="text-brand-500" />;
    case 'sprout':  return <Sprout   size={size} className="text-green-500" />;
    case 'rocket':  return <Rocket   size={size} className="text-brand-500" />;
    case 'target':  return <Target   size={size} className="text-accent-500" />;
    case 'wizard':  return <BookOpen size={size} className="text-purple-500" />;
    case 'trophy':  return <Trophy   size={size} className="text-warning-500" />;
    case 'star':    return <Star     size={size} className="text-yellow-400" />;
    case 'thumb':   return <ThumbsUp size={size} className="text-green-500" />;
    case 'grad':    return <GraduationCap size={size} className="text-purple-500" />;
    case 'flask':   return <FlaskConical  size={size} className="text-brand-500" />;
    case 'octo':    return <Github   size={size} className="text-slate-700 dark:text-slate-300" />;
    case 'cal':     return <Calendar size={size} className="text-accent-500" />;
    case 'bronze':  return <Medal    size={size} className="text-amber-600" />;
    case 'silver':  return <Medal    size={size} className="text-slate-400" />;
    case 'gold':    return <Medal    size={size} className="text-yellow-500" />;
    case 'diamond': return <Gem      size={size} className="text-blue-400" />;
    case '🔥': return <Flame    size={size} className="text-warning-500" />;
    case '⚡': return <Zap      size={size} className="text-accent-500" />;
    case '💎': return <Gem      size={size} className="text-blue-400" />;
    case '🌱': return <Sprout   size={size} className="text-green-500" />;
    case '🎓': return <GraduationCap size={size} className="text-purple-500" />;
    case '🚀': return <Rocket   size={size} className="text-brand-500" />;
    case '🧪': return <FlaskConical  size={size} className="text-brand-500" />;
    case '🐙': return <Github   size={size} className="text-slate-700 dark:text-slate-300" />;
    case '📅': return <Calendar size={size} className="text-accent-500" />;
    case '🏆': return <Trophy   size={size} className="text-warning-500" />;
    case '🥉': return <Medal    size={size} className="text-amber-600" />;
    case '🥈': return <Medal    size={size} className="text-slate-400" />;
    case '🥇': return <Medal    size={size} className="text-yellow-500" />;
    case '💪': return <Dumbbell size={size} className="text-brand-500" />;
    case '⭐': return <Star     size={size} className="text-yellow-400" />;
    case '👍': return <ThumbsUp size={size} className="text-green-500" />;
    default:   return <Trophy   size={size} className="text-slate-400" />;
  }
};
