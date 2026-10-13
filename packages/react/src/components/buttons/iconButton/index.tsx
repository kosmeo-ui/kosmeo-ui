import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Button, { ButtonProps } from "../button";
import "./styles.css";

interface IconButtonProps extends ButtonProps {
  /** The FontAwesome icon that will be displayed in the Button */
  icon: IconProp;
}

const IconButton = (props: IconButtonProps) => {
  return (
    <Button {...props}>
      <div className={`k-icon-button-body`}>
        <FontAwesomeIcon icon={props.icon} />
        {props.children}
      </div>
    </Button>
  );
};
export default IconButton;
