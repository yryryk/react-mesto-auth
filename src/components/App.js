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

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isInfoTooltipPopupOpen, setIsInfoTooltipPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({
    about: "",
    name: ""
  });
  const [cards, setCards] = useState([]);
  const [email, setEmail] = useState("ghjllxdsjhjghg.,mnmbnvm,n.m/n/.,n,bk");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
    .then(([resultInfo, resultCards]) => {
      setCurrentUser(resultInfo);
      setCards(resultCards);
    })
    .catch((err) => {
      console.log(err);
    });
  },[]);

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

  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
    setIsInfoTooltipPopupOpen(true);
    navigate("/");
    console.log(loggedIn)
  }
  const handleRegister = () => {
    setIsInfoTooltipPopupOpen(true);
    setLoggedIn(true);
    console.log(loggedIn)
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>

      <Routes>
        <Route path="/" element={<Header />}>

          <Route index element={

            <Link to="/" className="auth-forms__link">
              <p className="auth-forms__email">{email}</p>
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
        <Route path="/" element={<ProtectedRoute loggedIn={loggedIn} component={
          () => <>
            <Main handlers={{
              onEditProfile: handleEditProfileClick,
              onAddPlace: handleAddPlaceClick,
              onEditAvatar: handleEditAvatarClick,
              onCardClick: handleCardClick,
              onCardLike: handleCardLike,
              onCardDelete: handleCardDelete}}
            cards={cards} />
            <Footer />
          </>} />}
        />
        <Route path="/signin" element={<Login handleLogin={handleLogin} />} />
        <Route path="/signup" element={<Register handleRegister={handleRegister} />} />
        <Route path="*" element={loggedIn ? <Navigate to="/" /> : <Navigate to="/signin" />}/>
      </Routes>

      <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
      <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlace} />
      <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
      <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      <InfoTooltip isOpen={isInfoTooltipPopupOpen} onClose={closeAllPopups} message={loggedIn} success={loggedIn} />

    </CurrentUserContext.Provider>
  );
}

export default App;
