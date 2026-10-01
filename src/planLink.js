import React from 'react';

// Legătura dintre lista de aparataje și panoul de plan din pagina proiectului.
//   active  - panoul de plan e deschis (rândurile pot fi trase pe plan)
//   locate  - (assemblyId) => centrează planul pe aparatul respectiv
export const PlanLinkContext = React.createContext({ active: false, locate: null });

export const usePlanLink = () => React.useContext(PlanLinkContext);

// Tipul de date folosit la tragerea unui aparataj din listă pe plan
export const ASSEMBLY_DRAG_TYPE = 'application/x-assembly-id';
