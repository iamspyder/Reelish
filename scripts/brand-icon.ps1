Add-Type -AssemblyName System.Drawing
function New-ReelishIcon([int]$size) {
 $b=New-Object System.Drawing.Bitmap($size,$size)
 $g=[System.Drawing.Graphics]::FromImage($b)
 $g.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
 $g.Clear([System.Drawing.Color]::FromArgb(25,25,28))
 $f=New-Object System.Drawing.Font('Segoe UI',($size*.62),([System.Drawing.FontStyle]::Bold -bor [System.Drawing.FontStyle]::Italic),[System.Drawing.GraphicsUnit]::Pixel)
 $brush=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,184,0))
 $format=New-Object System.Drawing.StringFormat
 $format.Alignment=[System.Drawing.StringAlignment]::Center
 $format.LineAlignment=[System.Drawing.StringAlignment]::Center
 $g.DrawString('R',$f,$brush,(New-Object System.Drawing.RectangleF(0,0,($size*.98),($size*.98))),$format)
 $g.Dispose();$f.Dispose();$brush.Dispose();return $b
}
$large=New-ReelishIcon 1024
$large.Save((Join-Path $PWD 'build/icon.png'),[System.Drawing.Imaging.ImageFormat]::Png);$large.Dispose()
$small=New-ReelishIcon 256
$stream=New-Object System.IO.MemoryStream
$small.Save($stream,[System.Drawing.Imaging.ImageFormat]::Png)
$bytes=$stream.ToArray()
$output=[System.IO.File]::Create((Join-Path $PWD 'build/icon.ico'))
$writer=New-Object System.IO.BinaryWriter($output)
$writer.Write([uint16]0);$writer.Write([uint16]1);$writer.Write([uint16]1)
$writer.Write([byte]0);$writer.Write([byte]0);$writer.Write([byte]0);$writer.Write([byte]0)
$writer.Write([uint16]1);$writer.Write([uint16]32);$writer.Write([uint32]$bytes.Length);$writer.Write([uint32]22);$writer.Write($bytes)
$writer.Dispose();$output.Dispose();$stream.Dispose();$small.Dispose()
