import React, { useEffect, useState } from "react";
import DarkMode from "./DarkMode/Darkmode";
import Notification from "./Notification/Notification";
import { IoMdNotifications } from "react-icons/io";
import { TfiReload } from "react-icons/tfi";
import TypeWriter from "typewriter-effect";
import Calendar from "./Calendar/Calendar";
import axios from "axios";
import Aos from "aos";
import "aos/dist/aos.css";

const Profile = ({ tasks }) => {
  const [quote, setQuote] = useState("Loading inspiration...");
  const [author, setAuthor] = useState("");
  const [user, setUser] = useState();
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [dialog, setDialog] = useState({
    isLoading: false,
  });

  axios.defaults.withCredentials = true;

  // SOLUTION: Centralized HTTPS fetch function for the new API
  const getNewQuote = () => {
    // Using HTTPS and a stable 2026 alternative (ZenQuotes)
    fetch("https://zenquotes.io/api/random")
      .then((res) => res.json())
      .then((data) => {
        // ZenQuotes returns an array: [{ q: "quote", a: "author" }]
        setQuote(data[0].q);
        setAuthor(data[0].a);
      })
      .catch((err) => {
        console.error("Quote Error:", err);
        setQuote("The only way to do great work is to love what you do.");
        setAuthor("Steve Jobs");
      });
  };

  useEffect(() => {
    Aos.init({ duration: 1200 });
    
    // SOLUTION: Call the secure function on mount
    getNewQuote();

    axios
      .get(`${process.env.REACT_APP_API_URL}/getUser`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/task/getTask`)
      .then((res) => {
        let temp = res.data.filter(
          (obj) =>
            obj.done === false &&
            obj.task.deadline === new Date().toISOString().split("T")[0]
        );
        setUpcomingTasks(temp);
      })
      .catch((err) => console.log(err));
  }, [tasks]);

  // SOLUTION: Manual reload now uses the secure function
  const reloadQuote = () => {
    getNewQuote();
  };

  function openNotifi() {
    setDialog({ isLoading: true });
  }
  function closeNotifi() {
    setDialog({ isLoading: false });
  }

  return (
    <React.Fragment>
      <div className="profile" data-aos="fade-left">
        <div className="profile-div">
          <DarkMode />
          <button
            className={`${upcomingTasks.length ? " bell" : ""}`}
            onClick={openNotifi}
          >
            <span id="noti-count">{upcomingTasks.length}</span>
            <span>
              <IoMdNotifications size={25} color="#3081D0" />
            </span>
          </button>
          <img
            title={user && `${user.userName}`}
            id="prof-img"
            src={user && `${user.picUrl}`}
            alt=""
          />
        </div>
        {dialog.isLoading && (
          <Notification
            closeNotifi={closeNotifi}
            upcomingTasks={upcomingTasks}
          />
        )}
        <Calendar />
        <div className="quote-div" data-aos="zoom-in">
          <h3>
            {/* Added key={quote} to force TypeWriter to reset when quote changes */}
            <TypeWriter
              key={quote}
              options={{
                autoStart: true,
                loop: true,
                delay: 100,
                strings: [`" ${quote} "`],
              }}
            />
          </h3>
          <hr />
          <div className="quote-footer">
            <h4 id="auth-name"> - {author}</h4>
            <button onClick={reloadQuote}>
              <TfiReload color="orangered" size={18} />
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Profile;
