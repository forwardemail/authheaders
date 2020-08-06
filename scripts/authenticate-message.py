#!/usr/bin/env python

import authheaders
import sys

def main():
    if len(sys.argv) < 3:
        print("Usage: authenticate-message.py authservId ip mailFrom helo", file=sys.stderr)
        sys.exit(1)

    if sys.version_info[0] >= 3:
        # Make sys.stdin and stdout binary streams.
        sys.stdin = sys.stdin.detach()
        sys.stdout = sys.stdout.detach()

    authservId = sys.argv[1]
    ip = sys.argv[2]
    mailFrom = sys.argv[3]

    message = sys.stdin.read()

    #try:
    if len(sys.argv) == 5:
        helo = sys.argv[4]
        header = authheaders.authenticate_message(msg=message, authserv_id=authservId, ip=ip, mail_from=mailFrom, helo=helo, spf=True, dkim=True, arc=True)
    else:
        header = authheaders.authenticate_message(msg=message, authserv_id=authservId, ip=ip, mail_from=mailFrom, spf=True, dkim=True, arc=True)
    sys.stdout.write(header.encode('utf8'))
        #sys.stdout.write(message)
    #except Exception as e:
        #print(e, file=sys.stderr)
        #sys.stdout.write(message)


if __name__ == "__main__":
    main()
