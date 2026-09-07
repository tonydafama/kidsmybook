$outlook = New-Object -ComObject Outlook.Application
$ns = $outlook.GetNamespace('MAPI')
$contacts = $ns.GetDefaultFolder(10)
Write-Host "Contact count:" $contacts.Items.Count
$out = @()
$i = 0
foreach ($c in $contacts.Items) {
    if ($i -ge 300) { break }
    $name = $c.FullName
    $email = ""
    try { $email = $c.Email1Address } catch {}
    $phone = ""
    try { $phone = $c.MobileTelephoneNumber } catch {}
    if ($email -or $phone) {
        $out += [PSCustomObject]@{name=$name; email=$email; phone=$phone}
        $i++
    }
}
$out | Export-Csv -Path "C:\Users\hkage\Desktop\Projects\MyBook-Cursor-continue\outlook_contacts.csv" -NoTypeInformation -Encoding UTF8
Write-Host "Exported" $out.Count "contacts to outlook_contacts.csv"
