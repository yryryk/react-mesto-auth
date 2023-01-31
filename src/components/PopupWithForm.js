function PopupWithForm(props) {

  function handleOverlayClose (evt) {
    if (evt.target.classList.contains('popup')) {
      props.onClose()
    }
  }

  return (
    <div className={`popup popup_type_${props.name} ${props.isOpen&&'popup_open'}`} id={`popup-${props.name}`} onClick={handleOverlayClose}>
      <div className="popup__window">
        <button aria-label="кнопка закрытия" type="button" className="button-opacity popup__close-button" onClick={props.onClose}></button>
        <h2 className="popup__title">{props.title}</h2>
        <form className="popup__form" name={props.name} onSubmit={props.onSubmit}>
          {props.children}
          <button aria-label="кнопка сохранить" type="submit" className="popup__submit-button">{props.buttonText}</button>
        </form>
      </div>
    </div>
  );
}

export default PopupWithForm;
