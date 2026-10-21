import { describe, expect, it } from 'vitest'
import {
  DEFAULT_STAFF_PERMISSIONS,
  FULL_STAFF_PERMISSIONS,
  PERMISSION_LABELS,
  permissionsFromStaff,
} from './permissions'

describe('staff permissions', () => {
  it('starts a guard with no privileged permissions', () => {
    expect(DEFAULT_STAFF_PERMISSIONS).toEqual({
      canViewContact: false,
      canEditGuests: false,
      canExport: false,
      canUndoCheckIn: false,
      canViewStats: false,
    })
  })

  it('copies every permission from a staff row', () => {
    expect(permissionsFromStaff(FULL_STAFF_PERMISSIONS)).toEqual(
      FULL_STAFF_PERMISSIONS,
    )
  })

  it('documents every permission in the UI', () => {
    const keys = PERMISSION_LABELS.map((permission) => permission.key)
    expect(keys.sort()).toEqual(
      Object.keys(DEFAULT_STAFF_PERMISSIONS).sort(),
    )
  })
})
