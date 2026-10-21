package fpt.sba.trungthu;

import fpt.sba.trungthu.service.impl.LocalStorageServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalStorageServiceTests {

    private static final String[] DOC_TYPES = {"application/pdf", "image/png", "image/jpeg"};

    @TempDir
    Path tempDir;

    private LocalStorageServiceImpl storage() {
        LocalStorageServiceImpl storage = new LocalStorageServiceImpl();
        ReflectionTestUtils.setField(storage, "basePath", tempDir.toString());
        ReflectionTestUtils.setField(storage, "baseUrl", "http://localhost:8080/uploads");
        return storage;
    }

    @Test
    void extensionComesFromContentTypeNotClientFilename() throws Exception {
        MockMultipartFile disguised = new MockMultipartFile("file", "virus.exe", "application/pdf", new byte[]{1, 2, 3});

        String url = storage().uploadFile(disguised, "compliance");

        assertThat(url).endsWith(".pdf").doesNotContain(".exe");
        try (var files = Files.list(tempDir.resolve("compliance"))) {
            assertThat(files.map(p -> p.getFileName().toString())).allMatch(name -> name.endsWith(".pdf"));
        }
    }

    @Test
    void rejectsExecutableAndOversizedFiles() {
        LocalStorageServiceImpl storage = storage();
        MockMultipartFile exe = new MockMultipartFile("file", "a.exe", "application/x-msdownload", new byte[]{1});
        MockMultipartFile big = new MockMultipartFile("file", "a.pdf", "application/pdf", new byte[11 * 1024 * 1024]);

        assertThatThrownBy(() -> storage.validateFile(exe, DOC_TYPES, 10)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> storage.validateFile(big, DOC_TYPES, 10)).isInstanceOf(IllegalArgumentException.class);
    }
}
