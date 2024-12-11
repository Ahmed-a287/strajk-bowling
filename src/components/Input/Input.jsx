import './Input.scss';

function Input({
  label,
  type,
  customClass,
  name,
  handleChange,
  defaultValue,
  disabled,
  maxLength,
}) {
  const id = `input-${name}`; //Creating a unique identifier for each input field as "input-when" "input-people" etc.

  return (
    <section className="input">
      <label className="input__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id} //Set the genrated ID on the input
        type={type}
        className={`input__field ${customClass ? customClass : ''}`}
        name={name}
        onChange={handleChange}
        defaultValue={defaultValue ? defaultValue : ''}
        maxLength={maxLength}
        disabled={disabled}
      />
    </section>
  );
}

export default Input;
