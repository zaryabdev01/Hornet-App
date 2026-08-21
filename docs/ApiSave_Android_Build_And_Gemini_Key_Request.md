Hi Nordine,

The Android internal-distribution build is ready:

**https://expo.dev/accounts/zaryabraza/projects/hornet-app/builds/53f119be-40c6-460b-858f-ed9138aa6fcb**

Open that link on an Android device (or scan the QR code shown on the
page) to install directly --- no Play Store involved. You may need to
allow "install from unknown sources" the first time.

One thing worth flagging directly: this build, and all of the M1--M4
reference-image testing so far, has been running against my own personal
Gemini API key, not yours. That was the fastest way to keep things
moving, but going forward it shouldn't stay that way --- both so any
usage is billed to your own account rather than mine, and because M3
will need your production key for the server-side proxy configuration
anyway. Better to make that switch now than carry it forward as a loose
end.

Could you generate a Gemini API key and send it over?

- Go to **aistudio.google.com/apikey** (just needs a Google account,
  free to create).
- Create a new API key.
- Send it over whenever convenient --- no rush on this specific build,
  which is already handled.

Once I have it, I'll swap it in for any further test builds, and it
becomes the key that goes into the M3 proxy setup directly --- this only
needs to happen once.

A couple of practical notes on handling it: treat it as sensitive on
your end the same way you would any credential, and you're welcome to
rotate/regenerate it afterward at any time from the same AI Studio page
if you'd feel more comfortable doing that once it's been shared.

Let me know once it's sent and I'll get it wired in.

Thank you.
