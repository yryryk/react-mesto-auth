import { useState, useEffect } from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import api from '../utils/Api';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import {CurrentUserContext} from '../contexts/CurrentUserContext';
import {Route, Routes, Navigate, useNavigate, Link} from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";
import Register from './Register';
import Login from './Login';
import InfoTooltip from './InfoTooltip';
import auth from '../utils/Auth';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isInfoTooltipPopupOpen, setIsInfoTooltipPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({
  });
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [successAuth, setSuccessAuth] = useState(false);
  const [messageAuth, setMessageAuth] = useState('');
  const [waitingLoad, setWaitingLoad] = useState(true);

  useEffect(() => {
    const jwt = localStorage.getItem("JWT");
    if (jwt) {
      auth.checkToken(jwt)
      .then((result) => {
        setLoggedIn(true);
        navigate("/");
        return result
      })
      .then((result) => {
        Promise.all([api.getUserInfo(), api.getInitialCards()])
        .then(([resultInfo, resultCards]) => {
          setCurrentUser({email: result.data.email, ...resultInfo});
          setCards(resultCards);
        })
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(()=>{
        setWaitingLoad(false);
      })

    }else{
      setWaitingLoad(false);
    }

  },[navigate]);

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }
  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true)
  }
  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true)
  }
  function closeAllPopups() {
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsInfoTooltipPopupOpen(false);
    setSelectedCard({});
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    api.changeLikeCardStatus(card._id, isLiked).then((newCard) => {
      setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
    })
    .catch((err) => {
      console.log(err);
    });
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id).then(() => {
      setCards((state) =>[...state.filter((c) => c._id !== card._id)]);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  function handleUpdateUser(inputValuesUser) {
    api.setUserInfo(inputValuesUser)
    .then((result) => {
      setCurrentUser(result);
      closeAllPopups();
    })
    .catch((err) => {
      console.log(err);
    });
  }

  function handleUpdateAvatar(inputValuesAvatar) {
    api.setUserAvatar(inputValuesAvatar)
    .then((result) => {
      setCurrentUser(result);
      closeAllPopups();
    })
    .catch((err) => {
      console.log(err);
    });
  }

  function handleAddPlace(inputValuesPlace) {
    api.setCard(inputValuesPlace)
    .then((newCard) => {
      setCards([newCard, ...cards]);
      closeAllPopups();
    })
    .catch((err) => {
      console.log(err);
    });
  }

  useEffect(() => {
    function handleKeyDown(evt) {
      if (evt.key === 'Escape') {
        closeAllPopups();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  },[]);

  const handleLogin = (inputValues) => {
    auth.signInUser(inputValues)
    .then((result) => {
      localStorage.setItem('JWT', result.token);
      setLoggedIn(true);
      navigate("/");
    })
    .catch((err) => {
      setSuccessAuth(false);
      setMessageAuth(err);
      setIsInfoTooltipPopupOpen(true);
      console.log(err);
    });
  }

  const handleRegister = (inputValues) => {
    auth.signUpUser(inputValues)
    .then(() => {
      setSuccessAuth(true);
      setIsInfoTooltipPopupOpen(true);
      navigate("/signin");
    })
    .catch((err) => {
      setSuccessAuth(false);
      setMessageAuth(err);
      setIsInfoTooltipPopupOpen(true);
      console.log(err);
    });
  }

  function handleQuit() {
    localStorage.removeItem('JWT');
    navigate("/signin");
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      
      <Routes>
        <Route path="/" element={<Header />}>

          <Route index element={
            <Link to="/signin" className="auth-forms__link" onClick={handleQuit}>
              <p className="auth-forms__email">{currentUser.email}</p>
              <p className="auth-forms__email">Выйти</p>
            </Link>
          } />
          <Route path="signin" element={
            <Link to="/signup" className="auth-forms__link">
              Зарегистрироваться
            </Link>
          } />
          <Route path="signup" element={
            <Link to="/signin" className="auth-forms__link">
              Войти
            </Link>
          } />

        </Route>
      </Routes>

      <Routes>
        <Route path="/" element={!waitingLoad&&<ProtectedRoute
          component={Main}
          loggedIn={loggedIn}
          handlers={{
            onEditProfile: handleEditProfileClick,
            onAddPlace: handleAddPlaceClick,
            onEditAvatar: handleEditAvatarClick,
            onCardClick: handleCardClick,
            onCardLike: handleCardLike,
            onCardDelete: handleCardDelete
          }}
          cards={cards}
          />}
        />
        <Route path="/signin" element={<Login handleLogin={handleLogin} />} />
        <Route path="/signup" element={<Register handleRegister={handleRegister} />} />
        <Route path="*" element={loggedIn ? <Navigate to="/" /> : <Navigate to="/signin" />}/>
      </Routes>
      <Footer />

      <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
      <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlace} />
      <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
      <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      <InfoTooltip isOpen={isInfoTooltipPopupOpen} onClose={closeAllPopups} message={messageAuth} success={successAuth} />

    </CurrentUserContext.Provider>
  );
}

export default App;
