import pyttsx3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid
import uvicorn
import os
import io
import json
import zipfile
from gtts import gTTS

from audio_merge import merge_audio_files_with_delay

load_dotenv()

origins = [
    os.environ.get("REST_API_URL"),
    os.environ.get("REST_API_URL") + os.environ.get("REST_API_PORT"),
]


app = FastAPI()
mp3_directory = "backend/src/assets/tmp"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Texts(BaseModel):
    texts: list[str]


@app.post("/text2speech")
def process_text(body: Texts):
    zip_buffer = io.BytesIO()
    for index, text in enumerate(body.texts):
        mp3_data = text2speech(text)
        file_name = str(index) + ".mp3"
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            zip_file.writestr(f"{file_name}", mp3_data)

    headers = {
        "Content-Disposition": "attachment; filename=audio_files.zip",
        "Content-Type": "application/zip",
    }

    return Response(content=zip_buffer.getvalue(), headers=headers)


@app.get("/merge-audio")
async def merge_audio_files(directory_path: str, delay_duration: int = 2000):
    if not os.path.isdir(mp3_directory + "/" + directory_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    merged_audio = merge_audio_files_with_delay(
        mp3_directory + "/" + directory_path, delay_duration
    )

    audio_data = io.BytesIO()
    merged_audio.export(audio_data, format="mp3")
    audio_data.seek(0)

    return StreamingResponse(audio_data, media_type="audio/mpeg")


def get_mp3_files(file_ids: list[str]):
    for file_id in file_ids:
        mp3_file_path = f"{mp3_directory}/{file_id}"
        if not os.path.exists(mp3_file_path):
            raise HTTPException(status_code=404, detail="MP3 file not found")

    return Response(content=json.dumps(file_ids), media_type="application/json")


def text2speech(text: str):
    engine = pyttsx3.init()
    engine.setProperty("rate", 120)
    engine.setProperty("volume", 1)
    voices = engine.getProperty("voices")
    engine.setProperty("voice", voices[1].id)
    temp_file = f"temp_{str(uuid.uuid4())}.mp3"
    engine.save_to_file(text, temp_file)
    engine.runAndWait()
    with open(temp_file, "rb") as f:
        mp3_data = f.read()
    os.remove(temp_file)
    return mp3_data


def text2speech_GTTS(text: str):
    try:
        tts = gTTS(text=text, lang="en")
        temp_file = f"temp_{str(uuid.uuid4())}.mp3"
        tts.save(temp_file)
        with open(temp_file, "rb") as f:
            mp3_data = f.read()
        os.remove(temp_file)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500, detail="Error in text to speech conversion"
        )
    return mp3_data


if __name__ == "__main__":
    uvicorn.run("text2speech:app", port=8443)
