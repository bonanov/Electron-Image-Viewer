const { remote } = window.electron;
const path = remote.require('path');

export const getError = callback => {
  try {
    callback();
  } catch (error) {
    return error;
  }
};

export const destructFilePath = filePath => {
  const dirName = path.dirname(filePath);
  const fileName = path.basename(filePath);
  return {
    dirName,
    fileName,
  };
};

export const shuffle = async array => {
  const copy = [];
  let n = array.length;
  let i;

  // While there remain elements to shuffle…
  while (n) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * array.length);

    // If not already shuffled, move it to the new array.
    if (i in array) {
      copy.push(array[i]);
      delete array[i];
      n--;
    }
  }

  return copy;
};

export const getFullPath = (a, b) => {
  if (a && b) return `${a}/${b}`;
  return '';
};
export const formatPath = a => {
  if (a) {
    return `file://${a}`;
  }
  return '';
};
export const formatFullPath = (a, b) => formatPath(getFullPath(a, b));
