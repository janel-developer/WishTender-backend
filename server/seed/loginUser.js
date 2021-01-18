//copy and paste and run in console on front end
const fetchPostJson = async (data, route, callbacks) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  await fetch(route, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data),
    headers,
  })
    .then((res) => res.json())
    .then((json) => {
      console.log('server response: ', json);
      callbacks(json);
    })
    .catch((err) => {
      console.log(new Error(`couldn't post json: ${err}`()));
    });
};
const asyncFunctionCall = async () => {
  fetchPostJson(
    { password: 'abcde123', email: 'dangerousdashie@gmail.com' },
    '/api/users/login',
    console.log
  );
};

asyncFunctionCall();
