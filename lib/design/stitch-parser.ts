export interface DesignSystem {
  colors: {
    primary: string
    primaryDark: string
    backgroundLight: string
    backgroundDark: string
    surfaceDark: string
    surfaceLight: string
    borderDark: string
  }
  typography: {
    fontFamily: string
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
}

export async function parseStitchDesign(designPath: string): Promise<DesignSystem | null> {
  try {
    const response = await fetch(`${designPath}/design-system.json`)
    if (!response.ok) return null
    
    const designData = await response.json()
    
    return {
      colors: designData.colors || {},
      typography: designData.typography || {},
      spacing: designData.spacing || {},
      borderRadius: designData.borderRadius || {},
    }
  } catch (error) {
    console.error('Error parsing Stitch design:', error)
    return null
  }
}

export function applyStitchColors(designSystem: DesignSystem) {
  const root = document.documentElement
  
  if (designSystem.colors) {
    Object.entries(designSystem.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }
}

export function getStitchColor(name: string, designSystem: DesignSystem): string {
  return designSystem.colors?.[name as keyof DesignSystem['colors']] || ''
}
