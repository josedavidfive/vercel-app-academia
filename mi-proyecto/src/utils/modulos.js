export function moduleName(modulo) {
  return modulo?.nombre || modulo?.titulo || "Sin título";
}

export function isActiveModule(modulo, index) {
  if (!modulo?.estado) return index < 2;
  return ["activo", "activa", "disponible", "active"].includes(
    String(modulo.estado).toLowerCase(),
  );
}

export function sortModules(modulos) {
  return [...modulos].sort((a, b) => {
    const orderA = Number(a.orden ?? a.numero ?? Number.MAX_SAFE_INTEGER);
    const orderB = Number(b.orden ?? b.numero ?? Number.MAX_SAFE_INTEGER);
    return orderA - orderB;
  });
}
