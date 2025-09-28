<?php
$data = json_decode(file_get_contents('php://input'), true);

$customerEmail = filter_var($data['customerEmail'], FILTER_SANITIZE_EMAIL);
$order         = strip_tags($data['order']);

$to      = "baselshahin2004@gmail.com";
$subject = "New Dessert Order from $customerEmail";
$message = "Customer Email: $customerEmail\n\nOrder Details:\n$order";
$headers = "From: noreply@yourdomain.com\r\nReply-To: $customerEmail";

if(mail($to, $subject, $message, $headers)){
  echo "Order email sent successfully.";
}else{
  http_response_code(500);
  echo "Failed to send email.";
}
?>
