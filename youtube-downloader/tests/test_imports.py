def test_imports():
    import app
    import downloader
    assert hasattr(app, 'app')
    assert hasattr(downloader, 'list_formats')
    assert hasattr(downloader, 'download_video')
