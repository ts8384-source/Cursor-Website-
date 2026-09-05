# Run once as Administrator so the iPad can reach this PC on the LAN.
netsh advfirewall firewall delete rule name="Drawing Loop Vite" | Out-Null
netsh advfirewall firewall add rule name="Drawing Loop Vite" dir=in action=allow protocol=TCP localport=5174 profile=any
Write-Host "Opened TCP 5174 for Drawing Loop."
