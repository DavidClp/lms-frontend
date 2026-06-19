import type { Module, ModuleAudience, Lesson } from '@/types'

export type ContentTrack = 'adult' | 'kids'

export function audiencesForTrack(track: ContentTrack): ModuleAudience[] {
  return track === 'kids' ? ['KIDS', 'ALL'] : ['ADULT', 'ALL']
}

export function defaultAudienceForTrack(track: ContentTrack): ModuleAudience {
  return track === 'kids' ? 'KIDS' : 'ADULT'
}

export function moduleMatchesTrack(module: Module, track: ContentTrack): boolean {
  const audience = module.audience ?? 'ADULT'
  return audiencesForTrack(track).includes(audience)
}

export function filterModulesByTrack(modules: Module[], track: ContentTrack): Module[] {
  return modules.filter((m) => moduleMatchesTrack(m, track))
}

export function filterLessonsByTrack(lessons: Lesson[], modules: Module[], track: ContentTrack): Lesson[] {
  const moduleIds = new Set(filterModulesByTrack(modules, track).map((m) => m.id))
  return lessons.filter((l) => moduleIds.has(l.moduleId))
}

export function modulesForStudentProfile(modules: Module[], profileMode?: 'ADULT' | 'KIDS'): Module[] {
  const track: ContentTrack = profileMode === 'KIDS' ? 'kids' : 'adult'
  return filterModulesByTrack(modules, track)
}

export function trackFromModule(module?: Module | null): ContentTrack {
  if (module?.audience === 'KIDS') return 'kids'
  return 'adult'
}

export function adminModulesBasePath(track: ContentTrack): string {
  return track === 'kids' ? '/admin/kids/modules' : '/admin/modules'
}

export function adminLessonsBasePath(track: ContentTrack): string {
  return track === 'kids' ? '/admin/kids/lessons' : '/admin/lessons'
}
