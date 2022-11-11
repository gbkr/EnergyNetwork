export const copyToClipboard = async (text: string) => {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
};

export const nodeType = (value: number) => {
  switch (value) {
    case 0:
      return "Genesis node";
    case 1:
      return "Validation node";
    case 2:
      return "Transaction node";

    default:
      return "Unknown";
  }
};
