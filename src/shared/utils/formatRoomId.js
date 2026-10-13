/**
 * formatRoomId.js
 *
 * Transforms internal room node IDs to user-facing display codes.
 * Used ONLY for display — never mutates the actual node IDs used in routing.
 *
 *   N101  →  SM101   (St Mary's Block)
 *   F101  →  CH101   (St Chavara Block)
 *
 * Any other value is returned unchanged.
 */
export function formatRoomId(id) {
  if (!id) return id;
  const str = String(id);
  if (/^N\d/.test(str)) return 'SM' + str.slice(1);
  if (/^F\d/.test(str)) return 'CH' + str.slice(1);
  return str;
}
