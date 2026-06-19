import { describe, it, expect, beforeEach } from 'vitest'
import { useDesignerStore } from '@/lib/store/designer'
import { act } from '@testing-library/react'

describe('designerStore', () => {
  beforeEach(() => {
    act(() => useDesignerStore.getState().reset())
  })

  it('starts with default state', () => {
    const s = useDesignerStore.getState()
    expect(s.car_name).toBe('')
    expect(s.bg_color).toBe('#111212')
    expect(s.box_size).toBe('minigt')
    expect(s.step).toBe(1)
  })

  it('setField updates a single field', () => {
    act(() => useDesignerStore.getState().setField('car_name', 'Lamborghini'))
    expect(useDesignerStore.getState().car_name).toBe('Lamborghini')
  })

  it('nextStep advances step', () => {
    act(() => useDesignerStore.getState().nextStep())
    expect(useDesignerStore.getState().step).toBe(2)
  })

  it('prevStep does not go below 1', () => {
    act(() => useDesignerStore.getState().prevStep())
    expect(useDesignerStore.getState().step).toBe(1)
  })

  it('reset returns to defaults', () => {
    act(() => {
      useDesignerStore.getState().setField('car_name', 'Ferrari')
      useDesignerStore.getState().nextStep()
      useDesignerStore.getState().reset()
    })
    const s = useDesignerStore.getState()
    expect(s.car_name).toBe('')
    expect(s.step).toBe(1)
  })
})
