const apiURL = "";
console.log("Initialized program");

const num = [22, 5, 69, 1, 2, 3, 4, 5, 6, 7];

function sortArray(array) {
  return array.sort((a, b) => a - b);
}

function removeDuplicates(arr) {
  return [...new Set(arr)];
}

numSorted = sortArray(num);
for (let i = 0; i < num.length; i++) {
  console.log(numSorted.at(i));
}
