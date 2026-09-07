# Best-effort LAN rules. Do not require Administrator — print and continue if netsh fails.
$ports = @(5174, 5175)
foreach ($port in $ports) {
  $name = "Drawing Loop TCP $port"
  netsh advfirewall firewall delete rule name="$name" | Out-Null
  netsh advfirewall firewall add rule name="$name" dir=in action=allow protocol=TCP localport=$port profile=any
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Could not open TCP $port (run as Administrator if another device needs LAN). Tailscale often still works."
  } else {
    Write-Host "Opened TCP $port for Drawing Loop."
  }
}
