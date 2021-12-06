const fs = require('fs');
const path = require('path');

/**
 *
 * @param {string} base directory to search in
 * @param {string} ext Extension you want to search for (e.g. '.abell')
 * @param {string[]} inputFiles Array of directories
 * @param {string[]} inputResult Holds the old input result
 * @return {string[]} Array of filepaths that end with given extension
 */
 function recursiveFindFiles(
  base,
  ext,
  inputFiles = undefined,
  inputResult = undefined
) {
  const files = inputFiles || fs.readdirSync(base);
  let result = inputResult || [];

  for (const file of files) {
    const newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recursiveFindFiles(
        newbase,
        ext,
        fs.readdirSync(newbase),
        result
      );
    } else {
      if (file.endsWith(ext)) {
        result.push(newbase);
      }
    }
  }

  return result;
}

module.exports = {
  recursiveFindFiles,
}