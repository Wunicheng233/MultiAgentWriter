import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Theme System', () => {
  it('should define all required CSS variables for Warm Parchment theme', () => {
    const cssPath = path.resolve(__dirname, '../index.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    const vars = [
      '--bg-primary', '--bg-secondary', '--bg-tertiary',
      '--text-primary', '--text-body', '--text-secondary', '--text-muted',
      '--accent-primary', '--accent-warm', '--accent-soft', '--accent-gold',
      '--border-default', '--border-strong', '--border-subtle',
      '--shadow-subtle', '--shadow-default', '--shadow-elevated'
    ]

    vars.forEach(v => {
      expect(cssContent).toContain(v)
    })
  })

  it('should define all three themes', () => {
    const cssPath = path.resolve(__dirname, '../index.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    expect(cssContent).toContain('Warm Parchment')
    expect(cssContent).toContain('Clean Light')
    expect(cssContent).toContain('Deep Dark')
    expect(cssContent).toContain('[data-theme="clean-light"]')
    expect(cssContent).toContain('[data-theme="deep-dark"]')
  })
})
