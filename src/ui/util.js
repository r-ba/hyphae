// To-do: prevent or mitigate risk of collisions
const generateId = () => {
  let result = '';
  const characters = '0123456789ABCDEF';
  const charactersLength = characters.length;
  for ( let i = 0; i < 16; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
