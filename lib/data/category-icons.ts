// Lucide icon per category slug (UI only).
import {
  UtensilsCrossed, Sparkles, Camera, Waves,
  Scissors, Wand2, Heart, Music, GlassWater,
  Dumbbell, Star, Users,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  chef_prive:   UtensilsCrossed,
  massage:      Sparkles,
  photographe:  Camera,
  fitness:      Waves,
  coiffure:     Scissors,
  maquillage:   Wand2,
  babysitter:   Heart,
  musique:      Music,
  bar:          GlassWater,
  sport:        Dumbbell,
  evenement:    Star,
  danse:        Users,
}
