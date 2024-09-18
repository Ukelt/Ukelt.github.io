<?php
// submit_form.php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form input values
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format.";
        exit;
    }

    // Set your email details
    $to = "kieran.ph@hotmail.co.uk"; // Replace with your email address
    $subject = "New message from your website";
    $body = "Name: $name\nEmail: $email\nMessage: $message";
    $headers = "From: $email";

    // Send the email
    if (mail($to, $subject, $body, $headers)) {
        echo "Thank you for your message! I will get back to you soon.";
        header("Location: ../contact.html");
        exit;
    } else {
        echo "Error sending email. Please try again later.";
        header("Location: ../contact.html");
        exit;
    }
}
?>