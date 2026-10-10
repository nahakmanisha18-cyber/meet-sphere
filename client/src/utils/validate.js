export const registervalidateForm = ({
    fullName,
    email,
    mobileNumber,
    password,
    confirmPassword,
    setErrors,
    fullNameRef,
    emailRef,
    mobileRef,
    passwordRef,
    confirmPasswordRef,
}) => {

    const newErrors = {};

    if (!fullName.trim()) {
        newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!email.trim()) {
        newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address";
    }

    if (!mobileNumber.trim()) {
        newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(mobileNumber)) {
        newErrors.mobileNumber = "Enter a valid 10-digit mobile number";
    }

    if (!password) {
        newErrors.password = "Password is required";
    } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (newErrors.fullName) {
        fullNameRef.current?.focus();
    } else if (newErrors.email) {
        emailRef.current?.focus();
    } else if (newErrors.mobileNumber) {
        mobileRef.current?.focus();
    } else if (newErrors.password) {
        passwordRef.current?.focus();
    } else if (newErrors.confirmPassword) {
        confirmPasswordRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
};


export const loginvalidateForm = ({
    email,
    password,
    setErrors,
    emailRef,
    passwordRef,
}) => {

    const newErrors = {};

    if (!email.trim()) {
        newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
        newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (newErrors.email) {
        emailRef.current?.focus();
    } else if (newErrors.password) {
        passwordRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
};