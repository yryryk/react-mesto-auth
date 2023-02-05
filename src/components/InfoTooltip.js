import Popup from './Popup';

function InfoTooltip(props) {
  return (
    <Popup  name='info-tool-tip' {...props} >
      <div className="popup__auth-image" style={{
        backgroundImage: `${props.success?
          "../images/Yep.png":
          "../images/Nope.png"
        }`
      }} />
      <p className="popup__auth-message">{props.success?"Вы успешно зарегистрировались!":`Что-то пошло не так! Попробуйте ещё раз. ${props.message}`}</p>
    </Popup>
  );
}

export default InfoTooltip;
