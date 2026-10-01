import React from 'react';

// Legătura dintre lista de aparataje și panoul de plan din pagina proiectului.
//   active  - panoul de plan e deschis (rândurile pot fi trase pe plan)
//   locate  - (assemblyId) => centrează planul pe aparatul respectiv
//   planNames - { planId: nume }
//   projectId, photosByAssembly - { assemblyId: [poze] }
//   openPhotos - (assemblyId) => deschide pozele de șantier ale aparatului
//   uploadPhotos - (assemblyId, files) => urcă poze; photoUploadStatus - text în timpul urcării
export const PlanLinkContext = React.createContext({
  active: false, locate: null, planNames: {}, projectId: null, photosByAssembly: {}, openPhotos: null,
  uploadPhotos: null, photoUploadStatus: null,
});

export const usePlanLink = () => React.useContext(PlanLinkContext);

// Tipul de date folosit la tragerea unui aparataj din listă pe plan
export const ASSEMBLY_DRAG_TYPE = 'application/x-assembly-id';
