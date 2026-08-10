import React from 'react';
import type { CableTypeCategory } from '../../core/interfaces/cable';
import { CableCanvas } from './CableCanvas';

interface Props {
  type: CableTypeCategory;
}

/**
 * Small thumbnail of the cable cross-section drawn from EK_2 geometry.
 * Rendered on a light background for use in selection grids.
 */
export const CableIcon: React.FC<Props> = ({ type }) => (
  <CableCanvas cableType={type} width={72} height={56} thumbnail />
);
