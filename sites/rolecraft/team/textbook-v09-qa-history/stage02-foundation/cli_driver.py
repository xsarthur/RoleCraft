import sys, runpy, json, platform, hashlib
def deny(event, args):
    if event.startswith("socket.") or event in ("subprocess.Popen", "os.system", "os.exec", "os.spawn"):
        raise RuntimeError("QA_DENIED:" + event)
sys.addaudithook(deny)
source = sys.argv[1]
sys.argv = [source] + sys.argv[2:]
runpy.run_path(source, run_name="__main__")
