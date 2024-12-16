import Config from '../config.json';

// const apiCall = (path, body, token, m) => {
//   return new Promise((resolve, reject) => {
//     fetch('http://'+Config.server_host+':' + Config.server_port + '/' + path, {
//       method: m,
//       headers: {
//         'Content-type': 'application/json',
//         Authorization: token,
//       },
//       body: JSON.stringify(body),
//     })
//       .then((response) => {
//         return response.json();
//       })
//       .then((data) => {
//         if (data.error) {
//           reject(data.error);
//         } else {
//           resolve(data);
//         }
//       });
//   });
// };

const apiCallGet = (path, token) => {
  return new Promise((resolve, reject) => {
    fetch('http://'+Config.server_host+':' + Config.server_port + '/' + path, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });
  });
};

export const getNutrition = () => {
  return apiCallGet('nutrition_guide', '');
};
export const calculateNutrition = (nutritionType,ingredients) => {
  return apiCallGet('calculate_nutrition/'+nutritionType+'/'+ingredients, '');
};
