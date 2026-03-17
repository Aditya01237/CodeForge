const sendData = async () => {
    console.log("API CALLED 🚀"); // 👈 add this
  const res = await fetch("http://localhost:8080/api/problems", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 1,
      title: "Two Sum",
    }),
  });

  const data = await res.text();
  console.log(data);
};

export default sendData;