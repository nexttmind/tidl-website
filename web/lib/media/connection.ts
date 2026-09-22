type NetworkConnection = {
  saveData?: boolean;
  effectiveType?: string;
};

function readConnection(): NetworkConnection | null {
  const nav = navigator as Navigator & {
    connection?: NetworkConnection;
    mozConnection?: NetworkConnection;
    webkitConnection?: NetworkConnection;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

/** 3G and below, or the user asked to save data. 4G still gets one mobile video. */
export function connectionPrefersLite(): boolean {
  const connection = readConnection();
  if (!connection) return false;
  if (connection.saveData) return true;
  const type = connection.effectiveType;
  return type === "slow-2g" || type === "2g" || type === "3g";
}
