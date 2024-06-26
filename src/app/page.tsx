import axios from "axios";
import Main from "./home";
import "../app/App.scss";
import { Toaster } from "react-hot-toast";

const Home = async () => {
  try {
    const operatorTokenResponse = await axios.post(
      "https://api-pov.blackdice.ai/op/auth/login",
      {
        email: "operator@demo.com",
        pass: "123456",
      }
    );

    const uiToken = await axios.post("https://api-pov.blackdice.ai/pa/auth", {
      email: "service-platform@demo.com",
      pass: "123456",
    });

    return (
      <>
      <Main token={operatorTokenResponse.data} paToken={uiToken.data.token} />
      <Toaster position="top-right"/>
      </>

    );
  } catch (err) {
    console.log(err);
  }
};

export default Home;